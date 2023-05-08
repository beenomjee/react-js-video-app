import React, { useEffect, useRef, useState } from 'react'
import styles from './Call.module.scss'
import { useAuth, useEmail, useGetUsers, useWebSocket, } from '../../hooks'
import IconButton from '../IconButton/IconButton';
import { MdAddCall, MdCallEnd } from 'react-icons/md'
import { FiPhoneCall } from 'react-icons/fi'

const Call = () => {
    const user = useAuth();
    const [email, setEmail] = useEmail();
    const webRTCRef = useRef(null);
    const localStremRef = useRef(null);
    const remoteStremRef = useRef(null);
    const [socketRef, allConnectedUsers, callFrom, setCallFrom, isCalling, setIsCalling, nowCallingTo, setNowCallingTo, userVideoRef, myVideoRef] = useWebSocket(webRTCRef, localStremRef, remoteStremRef);
    const [users] = useGetUsers();

    const callHandler = async () => {
        setIsCalling(true);
        // Get candidates for caller
        webRTCRef.current.onicecandidate = (e) => {
            if (e.candidate) {
                socketRef.current.emit('candidate', { email, candidate: e.candidate });
            }
        };

        // creating offer
        const offerDesc = await webRTCRef.current.createOffer();
        await webRTCRef.current.setLocalDescription(offerDesc);

        const offer = {
            sdp: offerDesc.sdp,
            type: offerDesc.type,
        }

        socketRef.current.emit('call', { email, offer });
    }

    const rejectCallHandler = () => {
        socketRef.current.emit('reject', { email: callFrom });
        setCallFrom(null);
        setNowCallingTo(null);
        basicSetup();
    }

    const acceptCallHandler = async () => {
        setEmail(callFrom);
        // Get candidates for caller
        webRTCRef.current.onicecandidate = (e) => {
            if (e.candidate) {
                socketRef.current.emit('candidate', { callFrom: nowCallingTo ?? callFrom, candidate: e.candidate });
            }
        };

        // creating answer
        const answerDesc = await webRTCRef.current.createAnswer();
        await webRTCRef.current.setLocalDescription(answerDesc);

        const answer = {
            sdp: answerDesc.sdp,
            type: answerDesc.type,
        }

        socketRef.current.emit('accept', { email: callFrom, answer });
        setNowCallingTo(callFrom);
        setCallFrom(null);
        setIsCalling(true);
    }

    const callEndHandler = () => {
        setIsCalling(false);
        socketRef.current.emit('end', { email: nowCallingTo });
        setNowCallingTo(null);
        webRTCRef.current.close();
        basicSetup();
    }

    const basicSetup = async () => {
        const servers = {
            iceServers: [
                {
                    urls: ["stun:stun1.l.google.com:19302", "stun:stun2.l.google.com:19302"],
                },
            ],
            iceCandidatePoolSize: 10,
        };
        webRTCRef.current = new RTCPeerConnection(servers);

        // setting local stream and remote Stream
        localStremRef.current = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
        remoteStremRef.current = new MediaStream();

        localStremRef.current.getTracks().forEach(track => {
            webRTCRef.current.addTrack(track, localStremRef.current)
        });

        webRTCRef.current.ontrack = (e) => {
            e.streams[0].getTracks().forEach(track => {
                remoteStremRef.current.addTrack(track);
            });

        }

        myVideoRef.current.srcObject = localStremRef.current;
        userVideoRef.current.srcObject = remoteStremRef.current;
    };

    useEffect(() => {
        basicSetup();
    }, []);

    return (
        <>
            {
                callFrom &&
                <div className={`${styles.callFromContainer} ${callFrom ? "" : styles.displayNone}`}>
                    <div className={styles.user}>
                        <img src={users.find((u) => u.email === callFrom).file ? users.find((u) => u.email === callFrom).file : "/avatar.png"} alt={users.find((u) => u.email === callFrom).fName} />
                        <div className={styles.info}>
                            <span className={styles.name}>{`${users.find((u) => u.email === callFrom).fName} ${users.find((u) => u.email === callFrom).lName}`}</span>
                            <span className={styles.email}>{`${users.find((u) => u.email === callFrom).email}`}</span>
                        </div>
                    </div>

                    <div className={styles.buttons}>
                        <IconButton onClick={rejectCallHandler} className={styles.end}><MdCallEnd /></IconButton>
                        <IconButton onClick={acceptCallHandler} className={styles.accept}><FiPhoneCall /></IconButton>
                    </div>
                </div>
            }

            {/* video showing */}
            <div className={`${styles.container} ${callFrom ? styles.displayNone : email ? (isCalling ? "" : styles.displayNone) : styles.displayNone}`}>
                <div className={styles.center}>
                    <video ref={userVideoRef} src="#" playsInline autoPlay className={styles.userVideo}></video>
                    <video ref={myVideoRef} src="#" playsInline className={styles.myVideo} autoPlay muted></video>
                    <IconButton onClick={callEndHandler}><MdCallEnd /></IconButton>
                </div>
            </div>

            {/* make a call */}

            <div className={`${styles.container2} ${callFrom ? styles.displayNone : email ? (isCalling ? styles.displayNone : '') : styles.displayNone}`}>
                <h6 className={!allConnectedUsers[email] ? styles.error : allConnectedUsers[email].isAvailable ? styles.success : styles.info}>{!allConnectedUsers[email] ? "Not Online!" : allConnectedUsers[email].isAvailable ? "Avilable" : "Already in call."}</h6>
                <button onClick={callHandler} disabled={!allConnectedUsers[email]?.isAvailable}>Make a Call</button>
            </div>

            {/* when nothing available */}
            <div className={`${styles.notOpen} ${callFrom ? styles.displayNone : email ? styles.displayNone : ''}`}><span>Not Any User Selected</span></div>
        </>
    )
}

export default Call