import React, { useState, useEffect, useCallback } from 'react'

let logoutTimer

const AuthContext = React.createContext({
    token: '',
    isLoggedIn: false,
    onLogout: () => {},
    onLogin: (token, expirationDate) => {},
})

const retrivedStoredToken = () => {
    const storedToken = localStorage.getItem('token')
    const storedExpirationDate = localStorage.getItem('expirationDate')
    const remainingTime = calculateRemainingTime(storedExpirationDate)

    if (remainingTime <= 60000) {
        localStorage.removeItem('token')
        localStorage.removeItem('expirationDate')
        return null
    }

    return {
        token: storedToken,
        duration: remainingTime,
    }
}

const calculateRemainingTime = tokenExpirationDate => {
    const currentTime = new Date().getTime()
    const adjExpirationTime = new Date(tokenExpirationDate).getTime()
    const remainingDuration = adjExpirationTime - currentTime
    return remainingDuration
}

export const AuthContextProvider = props => {
    const tokenData = retrivedStoredToken()
    let initialToken
    if (tokenData) {
        initialToken = tokenData.token
    }
    const [token, setToken] = useState(initialToken)

    const userIsLoggedIn = !!token

    const logoutHandler = useCallback(() => {
        localStorage.removeItem('token')
        localStorage.removeItem('expirationDate')
        setToken(null)

        if (logoutTimer) {
            clearTimeout(logoutTimer)
        }
    }, [])

    const loginHandler = (token, tokenExpirationDate) => {
        localStorage.setItem('token', token)
        localStorage.setItem('expirationDate', tokenExpirationDate)
        setToken(token)

        const remainingTime = calculateRemainingTime(tokenExpirationDate)
        logoutTimer = setTimeout(logoutHandler, remainingTime)
    }

    const contextValue = {
        token: token,
        isLoggedIn: userIsLoggedIn,
        onLogout: logoutHandler,
        onLogin: loginHandler,
    }

    useEffect(() => {
        if (tokenData) {
            logoutTimer = setTimeout(logoutHandler, tokenData.duration)
        }
    }, [tokenData, logoutHandler])

    return (
        <AuthContext.Provider value={contextValue}>
            {props.children}
        </AuthContext.Provider>
    )
}

export default AuthContext
