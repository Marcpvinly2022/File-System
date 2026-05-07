import jwt from 'jsonwebtoken';
import {tokenBlacklist} from '../controllers/authController.js';
import  {redisClient}   from '../../utils/redisClient.js';

export const authenticate = (handler) => {
  return async (req, res) => {
    const authHeader = req.headers.authorization;
    if(authHeader && authHeader.startsWith('Bearer')){
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      res.statusCode = 401;
      return res.end(JSON.stringify({
        error: "Access denied: no token"
      }));
    }
//check if the token is in the blacklist
    //if(tokenBlacklist.has(token)){ //in memory logic

    // Check if this token exists in the Redis blacklist
      const isRevoked = await redisClient.get(token)
      if(isRevoked){
            res.statusCode = 401;
            return res.end(JSON.stringify({
              error: "Token has been revoked, please login again"
            }));
          }

  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // { id, role }
      // console.log("Decoded user info:", req.user);
      return await handler(req, res);
      
    } catch (error) {
      res.statusCode = 401;
      return res.end(JSON.stringify({
        error: "Invalid token"
      }));
    }
  };
};

}