import React, { useState, useContext } from 'react';

import './Auth.css';
import Card from '../../shared/components/UIElements/Card';
import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import {
   VALIDATOR_EMAIL,
   VALIDATOR_MINLENGTH,
   VALIDATOR_REQUIRE
} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { AuthContext } from '../../shared/context/auth-context';
import { useHttpClient } from '../../shared/hooks/http-hook';
import ImageUpload from '../../shared/components/FormElements/ImageUpload';

const Auth = () => {
   const auth = useContext(AuthContext);
   const [isLogin, setIsLogin] = useState(true);
   const { isLoading, error, sendRequest, clearError } = useHttpClient();

   const [formState, inputHandler, setFormData] = useForm(
      {
         email: {
            value: '',
            isValid: false
         },
         password: {
            value: '',
            isValid: false
         }
      },
      false
   );

   const authSubmitHandler = async e => {
      e.preventDefault();

      if (isLogin) {
         try {
            const responseData = await sendRequest(
               `${process.env.REACT_APP_BACKEND_URL}/users/login`,
               'POST',
               JSON.stringify({
                  email: formState.inputs.email.value,
                  password: formState.inputs.password.value
               }),
               {
                  'Content-Type': 'application/json'
               }
            );
            auth.login(responseData.userId, responseData.token);
         } catch (err) {
            console.log(err);
         }
      } else {
         try {
            const formData = new FormData();
            formData.append('email', formState.inputs.email.value);
            formData.append('name', formState.inputs.name.value);
            formData.append('password', formState.inputs.password.value);
            formData.append('image', formState.inputs.image.value);

            const responseData = await sendRequest(
               process.env.REACT_APP_BACKEND_URL + '/users/signup',
               'POST',
               formData
            );
            auth.login(responseData.userId, responseData.token);
         } catch (err) {}
      }
   };

   const switchModeHandler = () => {
      if (!isLogin) {
         setFormData(
            {
               ...formState.inputs,
               name: undefined
            },
            formState.inputs.email.isValid && formState.inputs.password.isValid
         );
      } else {
         setFormData(
            {
               ...formState.inputs,
               name: {
                  value: '',
                  isValid: false
               }
            },
            false
         );
      }
      setIsLogin(prevMode => !prevMode);
   };

   return (
      <>
         <ErrorModal error={error} onClear={clearError} />
         <Card className="authentication">
            {isLoading && <LoadingSpinner asOverlay />}
            <h2>Login Required</h2>
            <form onSubmit={authSubmitHandler}>
               {!isLogin && (
                  <Input
                     element="input"
                     id="name"
                     type="text"
                     label="Your Name"
                     validators={[VALIDATOR_REQUIRE()]}
                     errorText="please enter a name"
                     onInput={inputHandler}
                  />
               )}
               {!isLogin && (
                  <ImageUpload center id="image" onInput={inputHandler} />
               )}
               <Input
                  element="input"
                  id="email"
                  type="email"
                  label="Email"
                  validators={[VALIDATOR_EMAIL()]}
                  errorText="enter valid email"
                  onInput={inputHandler}
               />
               <Input
                  element="input"
                  id="password"
                  type="password"
                  label="Password"
                  validators={[VALIDATOR_MINLENGTH(6)]}
                  errorText="Please enter at least 5 characters"
                  onInput={inputHandler}
               />
               <Button type="submit" disabled={!formState.isValid}>
                  {isLogin ? 'Login' : 'Sign Up'}
               </Button>
            </form>
            <Button inverse onClick={switchModeHandler}>
               Switch to {isLogin ? 'Sign Up' : 'Login'}
            </Button>
         </Card>
      </>
   );
};

export default Auth;
