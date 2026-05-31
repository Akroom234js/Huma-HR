import React from 'react';
import AssignNewTask from '../AssignNewTask/AssignNewTask';

const EditTaskPanel = (props) => {
    // This component is now a clean wrapper around the unified AssignNewTask form,
    // which completely eliminates duplicate code and adheres to the DRY principle.
    return <AssignNewTask isEdit={true} {...props} />;
};

export default EditTaskPanel;
