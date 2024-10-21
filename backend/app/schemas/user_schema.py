from marshmallow import Schema, fields, validate

class UserSchema(Schema):
    user_id = fields.Str(validate=validate.Regexp(r'^[a-zA-Z0-9._@]+$', error="user_id must be a valid email format or alphanumeric with underscores, dots, and @ allowed"))
    first_name = fields.Str(required=True) 
    last_name = fields.Str(required=True) 
    password = fields.Str(required=True)
    simulations = fields.List(fields.Str(validate=validate.Length(equal=24)), required=False)  # Optional
    email = fields.Email(required=True)
    settings = fields.Dict(required=False)  # Optional
    isAdmin = fields.Bool(required=False) # default false

# Create an instance of the UserSchema
user_schema = UserSchema()
