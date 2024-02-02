const generateOtp = () => {
    const digits = "0123456789";
    let otp = ""
    let i = 0;
    for (i; i < 6; i++) {
        otp += digits[Math.floor(Math.random() * 10)]
    }
    return otp;
}

export {generateOtp}