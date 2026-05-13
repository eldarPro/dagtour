import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  let step = 'init';
  try {
    step = 'parse_body';
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    const phone = body?.phone;
    if (!phone) return json({ error: 'phone required' }, 400);

    step = 'normalize';
    const normalizedPhone = String(phone).replace(/[^\d]/g, '');

    step = 'zvonok_fetch';
    const zvonokKey = Deno.env.get('ZVONOK_API_KEY');
    const campaignId = Deno.env.get('ZVONOK_CAMPAIGN_ID') || '187272583';
    let confirmed = !zvonokKey; // в dev режиме без ключа — пропускаем

    if (zvonokKey) {
      const url = `https://zvonok.com/manager/cabapi_external/api/v1/phones/calls_by_phone/?campaign_id=${campaignId}&phone=%2B${normalizedPhone}&public_key=${zvonokKey}`;
      const resp = await fetch(url);

      step = 'zvonok_parse';
      const calls = await resp.json();
      const tenMinAgo = new Date(Date.now() - 10 * 60 * 1000);
      confirmed = Array.isArray(calls) && calls.some((c: { call_status: string; updated: string }) =>
        c.call_status === 'pincode_ok' && new Date(c.updated) > tenMinAgo
      );
    }

    if (!confirmed) return json({ error: 'Звонок не подтверждён' }, 400);

    step = 'supabase_init';
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const fakeEmail = `${normalizedPhone}`;

    step = 'db_lookup';
    const { data: existingUserId, error: rpcError } = await supabase
      .rpc('get_user_id_by_phone', { phone_param: normalizedPhone });
    if (rpcError) return json({ error: 'DB lookup error: ' + rpcError.message }, 500);

    let isNewUser = false;

    if (existingUserId) {
      // Ensure existing user has the fake email so generateLink works
      step = 'ensure_email';
      const { data: existingUserData } = await supabase.auth.admin.getUserById(existingUserId as string);
      if (!existingUserData?.user?.email) {
        const { error: updateError } = await supabase.auth.admin.updateUserById(existingUserId as string, {
          email: fakeEmail,
          email_confirm: true,
        });
        if (updateError) return json({ error: 'Ошибка обновления пользователя: ' + updateError.message }, 500);
      }
    } else {
      step = 'get_next_number';
      const { data: nextNum } = await supabase.rpc('get_next_user_number');
      const userName = `User #${(nextNum || 0) + 1}`;

      step = 'create_user';
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        phone: normalizedPhone,
        email: fakeEmail,
        phone_confirm: true,
        email_confirm: true,
        user_metadata: { phone: normalizedPhone, full_name: userName },
      });
      if (createError || !newUser?.user) {
        return json({ error: 'Не удалось создать пользователя: ' + createError?.message }, 500);
      }
      isNewUser = true;
    }

    step = 'generate_link';
    const { data: linkData, error: linkError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: fakeEmail,
    });
    if (linkError || !linkData?.properties?.hashed_token) {
      return json({ error: 'Не удалось создать токен: ' + linkError?.message }, 500);
    }

    return json({ hashed_token: linkData.properties.hashed_token, isNewUser });

  } catch (err) {
    return json({ error: `[${step}] ${String(err)}` }, 500);
  }
});
