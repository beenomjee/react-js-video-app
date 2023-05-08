import React from 'react'
import styles from './Sidebar.module.scss'
import { useEmail, useGetUsers } from '../../hooks'
import Loader2 from '../Loader2/Loader2';

const Sidebar = () => {
    const [users, isLoading] = useGetUsers();
    const [, setEmail] = useEmail();

    return (
        <div className={styles.container}>
            <form action="#">
                <input type="text" placeholder='Search user' required />
            </form>
            {/* users list */}
            {
                isLoading ? <Loader2 /> : (
                    <div className={styles.users}>
                        {
                            users.map((user, index) => (
                                <div key={index} className={styles.user} onClick={() => setEmail(user.email)}>
                                    <img src={user.file ? user.file : "/avatar.png"} alt={user.fName} />
                                    <div className={styles.info}>
                                        <span className={styles.name}>{`${user.fName} ${user.lName}`}</span>
                                        <span className={styles.email}>{`${user.email}`}</span>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                )
            }
        </div>
    )
}

export default Sidebar