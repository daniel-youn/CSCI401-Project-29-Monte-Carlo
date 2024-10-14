from marshmallow import Schema, fields, validate

class UserSchema(Schema):
    user_id = fields.Str(validate=validate.Regexp(r'^[a-zA-Z0-9._@]+$', error="user_id must be a valid email format or alphanumeric with underscores, dots, and @ allowed"))
    first_name = fields.Str(validate=[
        validate.Length(min=2, max=50),
        validate.Regexp(r'^[a-zA-Z]+$', error="First name must only contain letters")
    ], required=False)  # Optional
    last_name = fields.Str(validate=[
        validate.Length(min=2, max=50),
        validate.Regexp(r'^[a-zA-Z]+$', error="Last name must only contain letters")
    ], required=False)  # Optional
    # password = fields.Str(required=True, validate=[
    #     validate.Length(min=8, error="Password must be at least 8 characters long"),
    #     validate.Regexp(r'(?=.*[0-9])(?=.*[!@#$%^&*])', 
    #                     error="Password must include at least one number and one special character")
    # ])
    password = fields.Str(required=True)
    simulations = fields.List(fields.Str(validate=validate.Length(equal=24)), required=False)  # Optional
    email = fields.Email(required=True)
    settings = fields.Dict(required=False)  # Optional

# Create an instance of the UserSchema
user_schema = UserSchema()
