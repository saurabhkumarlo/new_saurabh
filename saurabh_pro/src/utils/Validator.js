export const emailRegex =
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const validateEmail = (email) => emailRegex.test(email);

export const passwordRegex = /^(?!.*[\s])(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

export const validatePassword = (password) => passwordRegex.test(password);

export const nameReqex = /^[a-zA-Z]{2,}\s[a-zA-Z]{2,}\s?([a-zA-Z]{1,})?\s?([a-zA-Z]{1,})?$/;

export const normalRegex = /^([A-Za-z]+ )+[A-Za-z]+$|^[A-Za-z]+$/;

export const phoneReqex = /^[+]*[(]{0,1}[0-9]{1,3}[)]{0,1}[-\s\./0-9]{8,14}$/g;
