"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import Link from "next/link"
import { useForm } from "react-hook-form"
import * as z from "zod"

const formSchema = z.object({
  name: z.string().min(2).max(100),
  age: z.number("Age must be a number").min(0, "Age must be a positive number").max(120, "Age must be less than or equal to 120")
})

export default function FormPage() {
  const { register, handleSubmit,formState } = useForm({
    defaultValues: {
      name: "John Doe",
      age: "30"
    },
    resolver: zodResolver(formSchema),
    criteriaMode:"firstError",
    // disabled:true,
    
  })
  return (<form style={{
    display:"flex",
    flexDirection:"column"
  }} onSubmit={handleSubmit((data) => {
    console.log(data)
  })}>
    <input type="text" {...register("name")} />
    <input type="   " {...register("age", { valueAsNumber: true })} />
    <input type="submit" />
    {formState.errors.name && <p>{formState.errors.name.message}</p>}
    {formState.errors.age && <p>{formState.errors.age.message}</p>}
    <Link href="/">Go back to Home</Link>
  </form>)
}