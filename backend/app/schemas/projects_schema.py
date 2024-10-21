from marshmallow import Schema, fields, validate
from datetime import datetime

class ProjectsSchema(Schema):
    project_name = fields.Str(required=True)  # Project name as string
    creation_time = fields.DateTime(required=True, default=datetime.utcnow)  # Creation time
    is_published = fields.Bool(required=True)  # Boolean: If the project is published or not
    
    # Mean and Standard Deviation of revenue for the 5th-year mark
    revenue_mean_5th_year = fields.Float(required=True)  
    revenue_std_5th_year = fields.Float(required=True)

    # List of users the project is shared to (user IDs as strings)
    shared_users = fields.List(fields.Str(validate=validate.Length(equal=24)), required=True)

    # Admin user ID (string)
    admin_user_id = fields.Str(validate=validate.Length(equal=24), required=True)

    # Simulation IDs (Normal, Admin, Cross-Check)
    normal_sim_id = fields.Str(validate=validate.Length(equal=24), required=True)
    admin_sim_id = fields.Str(validate=validate.Length(equal=24), required=True)
    cross_check_sim_id = fields.Str(validate=validate.Length(equal=24), required=True)
    num_simulations = fields.Int(required=True)

# Example usage
projects_schema = ProjectsSchema()
