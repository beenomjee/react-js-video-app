import React, { useMemo } from 'react'
import styles from './HeaderMobile.module.scss'
import { useEmail, useGetUsers } from '../../hooks'
import { BiArrowBack } from 'react-icons/bi'
import IconButton from '../IconButton/IconButton'
import Loader2 from '../Loader2/Loader2'

const HeaderMobile = () => {
    const [email, setEmail] = useEmail();
    const [users, isLoading] = useGetUsers()
    const user = useMemo(() => {
        return users.find(u => u.email === email)
    }, [email, users]);

    return (
        <div className={styles.container}>
            <IconButton onClick={() => setEmail(null)} className={styles.button}><BiArrowBack /></IconButton>

            {
                isLoading ? <Loader2 /> : (
                    user &&
                    <div className={styles.user}>
                        <img src={user.file ? user.file : "/avatar.png"} alt={user.fName} />
                        <div className={styles.info}>
                            <span className={styles.name}>{`${user.fName} ${user.lName}`}</span>
                            <span className={styles.email}>{`${user.email}`}</span>
                        </div>
                    </div>
                )
            }

        </div>

    )
}

export default HeaderMobile