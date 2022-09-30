import { useState, useRef, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import classes from './AuthForm.module.css'
import AuthContext from '../../store/auth-context'

const AuthForm = () => {
    const [isLogin, setIsLogin] = useState(true)
    const [isLoading, setIsLoading] = useState(false)

    const authCtx = useContext(AuthContext)
    const history = useHistory()

    const enteredEmailRef = useRef()
    const enteredPasswordRef = useRef()

    const switchAuthModeHandler = () => {
        setIsLogin(prevState => !prevState)
    }

    const submitHandler = event => {
        setIsLoading(true)
        event.preventDefault()

        const eneteredEmail = enteredEmailRef.current.value
        const eneteredPassword = enteredPasswordRef.current.value

        let url
        if (isLogin) {
            url =
                'https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyCjAqRdEsx6R8nwnwqMvBa1shaGzng8siA'
        } else {
            url =
                'https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCjAqRdEsx6R8nwnwqMvBa1shaGzng8siA'
        }

        fetch(url, {
            method: 'POST',
            body: JSON.stringify({
                email: eneteredEmail,
                password: eneteredPassword,
                returnSecureToken: true,
            }),
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(response => {
                if (response.ok) {
                    return response.json()
                } else {
                    return response.json().then(data => {
                        let errorMessage = 'Authentication failed!'
                        if (data && data.error && data.error.message) {
                            errorMessage = data.error.message
                        }
                        throw new Error(errorMessage)
                    })
                }
            })
            .then(data => {
                const expirationTime = new Date(
                    new Date().getTime() + +data.expiresIn * 1000
                )
                authCtx.onLogin(data.idToken, expirationTime.toISOString())
                history.replace('/')
            })
            .catch(error => {
                alert(error.message)
            })
            .finally(() => {
                setIsLoading(false)
            })
    }

    return (
        <section className={classes.auth}>
            <h1>{isLogin ? 'Login' : 'Sign Up'}</h1>
            <form onSubmit={submitHandler}>
                <div className={classes.control}>
                    <label htmlFor='email'>Your Email</label>
                    <input
                        type='email'
                        id='email'
                        ref={enteredEmailRef}
                        required
                    />
                </div>
                <div className={classes.control}>
                    <label htmlFor='password'>Your Password</label>
                    <input
                        type='password'
                        id='password'
                        ref={enteredPasswordRef}
                        required
                    />
                </div>
                <div className={classes.actions}>
                    {!isLoading && (
                        <button>{isLogin ? 'Login' : 'Create Account'}</button>
                    )}
                    {isLoading && <p>Sending request...</p>}
                    <button
                        type='button'
                        className={classes.toggle}
                        onClick={switchAuthModeHandler}>
                        {isLogin
                            ? 'Create new account'
                            : 'Login with existing account'}
                    </button>
                </div>
            </form>
        </section>
    )
}

export default AuthForm
