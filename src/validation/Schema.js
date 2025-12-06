import * as yup from "yup";

export const schemaRegister = yup.object({
  fullName: yup
    .string()
    .required("Full Name is Required")
    .min(3, "Full Name should be at least 3 Character"),
  email: yup
    .string()
    .required("Email is Required")
    .matches(
      /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
      "Enter Vaild Mail extext@test.com"
    ),
  password: yup
    .string()
    .required("Password is Required")
    .min(5, "Password should be at least 5 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter"),
  role: yup.string().required("Role is Required"),
});

export const schemaLogin = yup.object({
  email: yup
    .string()
    .required("Email is required")
    .email("Enter a valid email"),
 password: yup
    .string()
    .required("Password is Required")
    .min(5, "Password should be at least 5 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter"),
});

/* export const schemaRegister = yup.object({
  email: yup
    .string()
    .required("Email is Required")
    .matches(
      /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/,
      "Enter Vaild Mail extext@test.com"
    ),
  firstname: yup
    .string()
    .required("FirstName is Required")
    .min(2, "FirstName Should be at least 2 Character"),
  lastname: yup
    .string()
    .required("Lastname is Required")
    .min(2, "Lastname Should be at least 2 Character"),
  username: yup
    .string()
    .required("Username is Required")
    .min(3, "Username Should be at least 3 Character"),
  address: yup
    .string()
    .required("address is Required")
    .min(5, "Address Should be at least 5 Character"),
  contact_number: yup
    .string()
    .required("Number is Required")
    .min(5, "Enter Number Vaild"),
  password: yup
    .string()
    .required("password is Required")
    .min(5, "Pass Should be at least 5 Character or Num"),
  c_password: yup
    .string()
    .oneOf([yup.ref("password")], "Password and Repassword Must be Match")
    .required("Repassword is Required"),
  type: yup.string().required("Type Is Required"),
}); */
