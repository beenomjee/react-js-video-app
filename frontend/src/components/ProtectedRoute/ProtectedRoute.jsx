import React, { useEffect, useState } from 'react'
import styles from './ProtectedRoute.module.scss';
import { Loader } from '../';
import { useNavigate } from 'react-router-dom';
import { EmailProvider, GetUsersProvider, UserProvider } from '../../context';

const ProtectedRoute = ({ element: Element }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    useEffect(() => {
        const loadUser = () => {
            setIsLoading(true);
            const user = window.localStorage.getItem('user');
            if (!user)
                navigate('/signin')

            setUser(JSON.parse(user));
            setIsLoading(false);
        }

        window.addEventListener('storage', loadUser);
        loadUser();

        return () => {
            window.removeEventListener('storage', loadUser);
        }
    }, []);
    return (
        isLoading ? <Loader /> : (
            <UserProvider user={user}>
                <EmailProvider>
                    <GetUsersProvider>
                        <Element />
                    </GetUsersProvider>
                </EmailProvider>
            </UserProvider>
        )
    )
}

export default ProtectedRoute;