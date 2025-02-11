const Employee = require('../models/Employee');

const employeeResolver = {
    Query: {
        getAllEmployees: async () => {
            try {
                return await Employee.find();
            } catch (error) {
                throw new Error('Error fetching employees: ' + error.message);
            }
        },
        searchEmployeeById: async (_, { id }) => {
            // Validation for ID
            if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
                throw new Error('Invalid employee ID');
            }
            try {
                const employee = await Employee.findById(id);
                if (!employee) {
                    throw new Error('Employee not found');
                }
                return employee;
            } catch (error) {
                throw new Error('Error fetching employee: ' + error.message);
            }
        },
        searchEmployee: async (_, { designation, department }) => {
            if (!designation && !department) {
                throw new Error("'designation' or 'department' must be provided.");
            }
            try {
                const filter = {};
                if (designation) filter.designation = designation;
                if (department) filter.department = department;
                
                const employees = await Employee.find(filter);
                
                if (employees.length === 0) {
                    throw new Error("No employees found matching the given criteria.");
                }
                
                return employees;
            } catch (error) {
                throw new Error("Error searching employees: " + error.message);
            }
        },
    },
    Mutation: {
        addEmployee: async (_, { 
            first_name, 
            last_name, 
            email, 
            gender, 
            designation, 
            salary, 
            date_of_joining, 
            department, 
            employee_photo 
        }) => {
            try {
                // Validation
                if (!first_name || !last_name || !email || !gender || !designation || !salary || !date_of_joining || !department) {
                    throw new Error('All fields are required');
                }

                if (!/^\S+@\S+\.\S+$/.test(email)) {
                    throw new Error('Invalid email format');
                }

                if (typeof salary !== 'number' || salary <= 0) {
                    throw new Error('Salary must be a positive number');
                }

                // Regex to validate date format - YYYY-MM-DD
                if (!/^\d{4}-\d{2}-\d{2}$/.test(date_of_joining)) {
                    throw new Error('Invalid date format for date_of_joining. Expected format: YYYY-MM-DD');
                }

                // Regex to validate URL - http or https, image extension
                if (employee_photo && 
                    !/^https?:\/\/[^\s$.?#].[^\s]*\.(?:jpg|jpeg|png|gif|bmp|webp|svg)$/i
                    .test(employee_photo)) {
                    throw new Error('Invalid URL for employee photo');
                }

                // Check if an employee with same email exists
                const existingEmployee = await Employee.findOne({ email });
                if (existingEmployee) {
                    throw new Error('An employee with this email already exists');
                }

                const newEmployee = new Employee({
                    first_name,
                    last_name,
                    email,
                    gender,
                    designation,
                    salary,
                    date_of_joining,
                    department,
                    employee_photo,
                });
                return await newEmployee.save();
            } catch (error) {
                throw new Error('Error adding employee: ' + error.message);
            }
    },
        updateEmployee: async (_, { 
            id, 
            first_name, 
            last_name, 
            designation, 
            salary, 
            department
        }) => {
            // Validation
            if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
                throw new Error('Invalid employee ID');
            }
            if (!first_name || first_name.trim().length === 0) {
                throw new Error('First name is required');
            }
            if (!last_name || last_name.trim().length === 0) {
                throw new Error('Last name is required');
            }
            if (!designation || designation.trim().length === 0) {
                throw new Error('Designation is required');
            }
            if (!salary || isNaN(salary)) {
                throw new Error('Salary must be a valid number');
            }
            if (!department || department.trim().length === 0) {
                throw new Error('Department is required');
            }

            // Mongoose validation
            const employee = await Employee.findById(id);
                if (!employee) {
                    throw new Error("Employee not found");
                }

            try {
                return await Employee.findByIdAndUpdate(
                    id, { 
                        first_name, 
                        last_name, 
                        designation, 
                        salary, 
                        department }, { new: true });
            } catch (error) {
                throw new Error('Error updating employee: ' + error.message);
            }
        },
        deleteEmployee: async (_, { id }) => {
            try {
                // Validation
                if (!id || !/^[0-9a-fA-F]{24}$/.test(id)) {
                    throw new Error('Invalid employee ID');
                }
                // Mongoose validation
                const employee = await Employee.findById(id);
                if (!employee) {
                    throw new Error("Employee not found");
                }
                await Employee.findByIdAndDelete(id);
                return "Employee successfully deleted";
            } catch (error) {
                throw new Error("Error deleting employee: " + error.message);
            }
        },
    },
};

module.exports = employeeResolver;
