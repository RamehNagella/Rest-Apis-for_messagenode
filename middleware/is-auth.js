const jwt = require('jsonwebtoken');

module.exports = (req,res,next)=>{
	
	const authHeader = req.get('Authorization');
	// console.log('authHeader:::: ',authHeader)
	if(!authHeader){
		const error = new Error('Not authenticated.')
		error.statusCode = 401;
		throw error;
	}
	const token = authHeader.split(' ')[1];
	// console.log("isauthtoken>> ",token);
	let decodedToken;
	try{
		decodedToken = jwt.verify(token,'somesupersecretsecret')
	}catch(err){
		// console.log(">>>>",err );
		err.statusCode = 500;
		throw err;
	}
	if(!decodedToken){
		const error = new Error('Not authenticated.');
		error.statusCode = 401;
		throw error;
	}
	req.userId = decodedToken.userId;
	next();
}