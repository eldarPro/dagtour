interface Props {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

const CheckboxRow: React.FC<Props> = ({ label, checked, onChange }) => (
  <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 16px', cursor: 'pointer', minHeight: '44px', borderBottom: '1px solid #f3f4f6' }}>
    <input
      type="checkbox"
      checked={checked}
      onChange={e => onChange(e.target.checked)}
      style={{ width: 20, height: 20, accentColor: 'var(--ion-color-primary)', cursor: 'pointer', flexShrink: 0 }}
    />
    <span style={{ fontSize: 15, color: '#111827' }}>{label}</span>
  </label>
);

export default CheckboxRow;
