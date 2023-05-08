import React, { useRef, useState } from 'react'
import styles from './Header.module.scss'
import IconButton from '../IconButton/IconButton';
import { IoIosMenu } from 'react-icons/io';
import Menu from '../Menu/Menu';
import { useAuth, useLogout } from '../../hooks';

const Header = () => {
    const user = useAuth();
    const logout = useLogout();

    const [openMenu, setOpenMenu] = useState(false);
    const handleMenuClose = () => {
        setOpenMenu(false);
    }

    return (
        <>
            <div className={styles.container}>
                <div className={styles.left}>
                    <IconButton onClick={() => setOpenMenu(true)} className={styles.button}><IoIosMenu /></IconButton>
                    <Menu open={openMenu} closeHandler={handleMenuClose}>
                        <button onClick={logout} className={styles.button}>Logout</button>
                    </Menu>
                </div>
                <div className={styles.info}>
                    <img src={user && user.file ? user.file : "/avatar.png"} alt={user.fName} />
                    <span>{`${user.fName} ${user.lName}`}</span>
                </div>
            </div>
        </>
    )
}

export default Header