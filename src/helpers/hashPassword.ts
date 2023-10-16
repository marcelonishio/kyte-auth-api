import CryptoJS from 'crypto-js';

const hashPassword = (password: string): string => {
    const crypt = CryptoJS.SHA512(password)
    const passwordCrypt = CryptoJS.enc.Base64.stringify(crypt)
    return passwordCrypt
}

export default hashPassword
