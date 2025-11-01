import axiosInstance from '../../utils/axiosConfig';
import { User } from '../types/user';

export const signUp = (username: string, email: string, password: string, passwordConfirm: string) => {
    return (
        axiosInstance
            .post('/users/signup', {
                username,
                email,
                password,
                passwordConfirm,
                role: "user"
            })
            .then(async (response) => {
                return response.data.data.doc as User;
            })
            .catch(error => {
                throw error;
            })
    );
}

export const resendVerificationEmail = (email: string) => {
    return (
        axiosInstance
            .post('/users/verification/resend', {
                email
            })
            .then(async (response) => {
                return response;
            })
            .catch(error => {
                throw error;
            })
    );
}

export const verifyEmail = (token: string) => {
    return (
        axiosInstance
            .post(`/users/verifyEmail/${token}`)
            .then(async (response) => {
                return response;
            })
            .catch(error => {
                throw error;
            })
    );
}

export const logIn = (email: string, password: string) => {
    return (
        axiosInstance
            .post('/users/login', {
                email,
                password
            })
            .then((response) => {
                return response.data.data.user as User;
            })
            .catch(error => {
                throw error;
            })
    );
}

export const logOut = () => {
    return (
        axiosInstance
            .get('/users/logout')
            .then(() => {
                return;
            })
            .catch(error => {
                throw error;
            })
    );
}

export const forgotPassword = (emailAddress: string) => {
    return (
        axiosInstance
            .post('/users/forgotPassword', {
                email: emailAddress
            })
            .then((response) => {
                return {
                    message: response.data.message as string,
                    status: response.data.status as string
                };
            })
            .catch(error => {
                throw error;
            })
    );
}

export const resetPassword = (password: string, passwordConfirm: string, token: string) => {
    return (
        axiosInstance
            .patch(`/users/resetPassword/${token}`, {
                password,
                passwordConfirm
            })
            .then((response) => {
                return {
                    message: response.data.message as string,
                    status: response.data.status as string
                };
            })
            .catch(error => {
                throw error;
            })
    );
}

export const updateUserPassword = (passwordCurrent: string, password: string, passwordConfirm: string) => {
    return (
        axiosInstance
            .patch('/users/updateMyPassword', {
                passwordCurrent, 
                password, 
                passwordConfirm
            })
            .then((response) => {
                return response.data.data.user as User;
            })
            .catch((error) => {
                throw error;
            })
    );
}

export const getUserInfo = async () => {
    return ( 
        axiosInstance
            .get('/users/me')
            .then((response) => {
                return response.data.data.doc as User;
            })
            .catch((error) => {
                throw error;
            })
    );
}

export const updateUserInfo = (updatedInfo: { [key: string]: string }) => {
    return (
        axiosInstance
            .patch('/users/updateMe', updatedInfo)
            .then((response) => {
                return response.data.data.data as User;
            })
            .catch((error) => {
                throw error;
            })
    );
}

export const deleteUser = () => {
    return (
        axiosInstance.delete('/users/deleteMe')
            .then(response => {
                return response;
            })
    );
}