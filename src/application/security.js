import Jwt from 'jsonwebtoken';
import ResponseError from '../commons/response-error.js';

const generateAccessToken = (payload) => {
    const token = Jwt.sign(payload, process.env.JWT_ACCESS_TOKEN_SECRET || 'secret', {
        expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRED || '1h',
    });

    return token;
};

const generateRefreshToken = (payload) => {
    const token = Jwt.sign(payload, process.env.JWT_REFRESH_TOKEN_SECRET || 'secret');

    return token;
};

const verifyAccessToken = (token) => {
    try {
        return Jwt.verify(token, process.env.JWT_ACCESS_TOKEN_SECRET || 'secret');
    } catch (error) {
        throw new ResponseError(401, 'Invalid access token.');
    }
};

const verifyRefreshToken = (token) => {
    try {
        return Jwt.verify(token, process.env.JWT_REFRESH_TOKEN_SECRET);
    } catch (error) {
        throw new ResponseError(401, 'Invalid refresh token.');
    }
};

const verifyApiKey = (apiKey) => {
    if (apiKey !== process.env.API_KEY) {
        throw new ResponseError(401, 'Invalid API Key.');
    }
};

const decodeToken = (token) => Jwt.decode(token);

export {
    generateAccessToken,
    generateRefreshToken,
    verifyAccessToken,
    verifyRefreshToken,
    decodeToken,
    verifyApiKey,
};
