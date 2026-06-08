import { redisClient } from '../../utils/redisClient.js';

export const loginIdempotency = async (req, res, next) => {

    const key = req.headers['x-idempotency-key'];

    if(!key){
        console.error("🛑 Architecture Violation: Request missing X-Idempotency-Key")
        return res.status(400).json({
            error: "Request signature mismatch",
            message: "The request could not be validated. Please refresh and try again."
        });
    }

    const lockKey = `lock:login:${key}`;
    const result = await redisClient.set(
        lockKey,
        "1",
        "EX",
        5,
        "NX"
    );

    if(result !== "OK"){
        console.warn(`[SECURITY] Potential replay/spam detected for key: ${key}`);
        return res.status(202).json({ // 202 means 'Accepted' but not yet processed
            status: "pending",
            message: "Your request is being synchronized. Please do not resubmit."
        });
    }

    // Capture original json to release lock on failure
    const originalJson = res.json.bind(res);
    res.json = function (data) {
        if(res.statusCode !== 200){
            redisClient.del(lockKey);
        }

        return originalJson(data);
    };
    next();

}