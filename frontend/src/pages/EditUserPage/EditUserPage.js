import React from 'react';
import EditUserForm from '../../components/EditUserForm/EditUserForm';  // Import the form
import { useParams } from 'react-router-dom';  // To get the userId from the URL if needed

const EditUserPage = () => {
  const { userId } = useParams();  // Assume you are passing userId in the URL params

  return (
    <div>
      <EditUserForm userId={userId} />  {/* Pass userId to the form */}
    </div>
  );
};

export default EditUserPage;
