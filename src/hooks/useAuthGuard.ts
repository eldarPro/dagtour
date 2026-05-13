import { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export const useAuthGuard = (targetPath: string) => {
  const { user } = useAuth();
  const history = useHistory();
  const [showAlert, setShowAlert] = useState(false);

  const navigate = () => {
    if (user) {
      history.push(targetPath);
    } else {
      setShowAlert(true);
    }
  };

  const goToLogin = () => {
    setShowAlert(false);
    history.push('/account');
  };

  return { navigate, showAlert, setShowAlert, goToLogin };
};
