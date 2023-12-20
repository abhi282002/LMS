//File uploading logic

client - Binary------>Server--convert->Image---->upload on cloudinary

# Multer

binary -----> image conversion done by multer and temporarly store

# Enter Email ---( Token + expiry )--->Gmail ---unique URL(domain.com/reset/?token=exgsysjjks)----->Browser(Enter new password)

# Part1

Email --> Validate in Database --> Generate New Token --> Send Email with new url containing token + save token with expiry in database

# Part2

Get Token from url query param --> Verify token in databases -->update password in database
