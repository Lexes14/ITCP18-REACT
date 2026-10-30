import * as yup from "yup";

export const loginSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});
export const profileSchema = yup.object({
  name: yup
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .required("Name is required"),
});
export const productSchema = yup.object({
  name: yup.string().required("Name is required"),
  slug: yup.string().required("Slug is required"),
  brand: yup.string().required("Brand is required"),
  sku: yup.string().required("SKU is required"),
  price: yup.number().min(0).required("Price is required"),
  stock: yup.number().integer().min(0).required("Stock is required"),
  description: yup.string().required("Description is required"),
});
export const validate = async (schema, value) => {
  try {
    await schema.validate(value, { abortEarly: false });
    return null;
  } catch (error) {
    return error.errors.join(", ");
  }
};
