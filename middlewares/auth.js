const jwt = require('jsonwebtoken');
const config = require('../config/config');

exports.protect = async (req, res, next) => {
  let token = req.headers.authorization;
    if (token) {
        try {
            let decode = jwt.verify(token, config.jwtSecret)
            req.user = decode
            next()
        } catch (error) {
            res.json({msg:error.message, success:false})
        }

    }
    else {
        res.json({msg:'token required', success:false})
    }

};