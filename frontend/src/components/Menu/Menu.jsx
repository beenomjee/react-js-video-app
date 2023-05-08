import React from 'react'
import styles from './Menu.module.scss';

const Menu = ({ children, open, closeHandler, className, ...props }) => {
    return (
        <>
            {open && <div onClick={closeHandler} className={styles.bgWrapper}></div>}
            <div {...props} className={`${styles.container} ${open ? styles.open : ''} ${className}`}>{children}</div>
        </>
    )
}

export default Menu