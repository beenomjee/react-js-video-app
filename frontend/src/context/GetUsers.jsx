import axios from "axios";
import { createContext, useCallback, useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";

export const GetUserContext = createContext([]);

export const GetUsersProvider = ({ children }) => {
    const [users, setUsers] = useState([])
    const [isLoading, setIsLoading] = useState(false);
    const user = useAuth();

    const getUsersRequest = useCallback(async () => {
        setIsLoading(true);
        try {
            const { data } = await axios.get(
                "http://localhost:3000/api/v1/auth/all/",
                {
                    params: {
                        token: user.token,
                    },
                }
            );
            setUsers(data);
            setIsLoading(false);
        } catch (err) {
            alert(err.message);
            console.log(err);
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        getUsersRequest();
    }, [getUsersRequest]);


    return <GetUserContext.Provider value={[users, isLoading]}>
        {children}
    </GetUserContext.Provider>;
};
