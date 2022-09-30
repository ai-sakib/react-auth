import classes from './ProfileForm.module.css'
import { useRef, useContext } from 'react'
import { useHistory } from 'react-router-dom'
import AuthContext from '../../store/auth-context'

const ProfileForm = () => {
    const newPasswordInputRef = useRef()
    const authCtx = useContext(AuthContext)
    const history = useHistory()

    const submitHandler = event => {
        event.preventDefault()
        const enteredNewPassword = newPasswordInputRef.current.value
        fetch(
            'https://identitytoolkit.googleapis.com/v1/accounts:update?key=AIzaSyCjAqRdEsx6R8nwnwqMvBa1shaGzng8siA',
            {
                method: 'POST',
                body: JSON.stringify({
                    idToken: authCtx.token,
                    password: enteredNewPassword,
                    returnSecureToken: false,
                }),
                headers: {
                    'Content-Type': 'application/json',
                },
            }
        )
            .then(response => {
                if (response.ok) {
                    return response.json()
                } else {
                    return response.json().then(data => {
                        let errorMessage = 'change password failed!'
                        if (data && data.error && data.error.message) {
                            errorMessage = data.error.message
                        }
                        throw new Error(errorMessage)
                    })
                }
            })
            .then(data => {
                console.log(data)
                history.replace('/')
            })
            .catch(error => {
                alert(error.message)
            })
    }

    return (
        <form className={classes.form} onSubmit={submitHandler}>
            <div className={classes.control}>
                <label htmlFor='new-password'>New Password</label>
                <input
                    type='password'
                    id='new-password'
                    ref={newPasswordInputRef}
                />
            </div>
            <div className={classes.action}>
                <button>Change Password</button>
            </div>
        </form>
    )
}

export default ProfileForm
