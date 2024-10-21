from marshmallow import Schema, fields, validate

class AccessDataSchema(Schema):
    cross_check_access = fields.Bool(required=True)  # Boolean field
    form_submitted = fields.Bool(required=True)      # Boolean field
    is_admin = fields.Bool(required=True)  # Boolean field
    
class ProjectsInfoSchema(Schema):
    """
        Stores the information about the projects that the user has access to
    """
    project_id = fields.Str(validate=validate.Length(equal=24), required=True)  # Project ID
    access_data = fields.Nested(AccessDataSchema, required=True)  # Access data for the project


class UserSchema(Schema):
    user_id = fields.Str(validate=validate.Regexp(r'^[a-zA-Z0-9._@]+$', error="user_id must be a valid email format or alphanumeric with underscores, dots, and @ allowed"))
    first_name = fields.Str(required=True) 
    last_name = fields.Str(required=True) 
    password = fields.Str(required=True)
    simulations = fields.List(fields.Str(validate=validate.Length(equal=24)), required=False)  # Optional
    email = fields.Email(required=True)
    settings = fields.Dict(required=False)  # Optional
    isAdmin = fields.Bool(required=True)
    projects = fields.Dict(
        keys=fields.Str(validate=validate.Length(equal=24)),  # project_id as key
        values=fields.Nested(ProjectsInfoSchema),  # Access data as value
        required=True
    )

# Create an instance of the UserSchema
user_schema = UserSchema()
