import React, { useState } from 'react'
import styles from './Home.module.scss';
import { Call, Header, HeaderMobile, Sidebar } from '../../components';
import { useEmail } from '../../hooks';


const Home = () => {
    const [email] = useEmail();
    return (
        <div className={styles.container}>
            <div className={`${styles.header} ${email ? styles.close : ""}`}>
                <Header />
            </div>
            {
                email && <div className={styles.headerMobile}>
                    <HeaderMobile />
                </div>
            }
            <div className={styles.page}>
                <div className={`${styles.sidebar} ${email ? styles.close : ''}`}><Sidebar /></div>
                <div className={styles.call}>
                    <Call />
                </div>
            </div>
        </div>
    )
}

export default Home