"use client"

import { useActionState, useEffect } from "react"
import { formState, SignupAction } from "../actions/signup-action"
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Field, FieldError } from "@/components/ui/field";
import { toast } from "@/components/ui/toast";
import { Spinner } from "@/components/ui/spinner";
import { redirect } from "next/navigation";
import { LogIn } from "lucide-react";

export default function SignupForm() {

    const [state, signup, isPending] = useActionState(
        async (_prevState: any, formData: FormData) => {
            const result = await SignupAction(_prevState as formState, formData);
            if (result?.fieldErrors) {
                return result?.fieldErrors;
            } else {
                toast.add({
                    type: result?.success ? "success" : "error",
                    description: result?.message,
                });

                if (result?.success) {
                    redirect("/login");
                }
            }
        }, null);

    // バリデーションメッセージ表示
    const errorText = (data: string[]) => {
        const list = [];
        for (let i = 0; i < data.length; i++) {
            list.push(<p key={i} className="pt-1 text-[12px] text-red-600">{data[i]}</p>)
        }

        return list;
    }

    return (
        <>
            <div className="flex flex-1 bg-muted"></div>
            <div className="flex flex-col justify-center items-center">
                <h1 className="font-extrabold text-4xl">新規会員登録</h1>
                <div className="mx-14 w-85">
                    <form className="flex flex-col justify-center items-center h-full" action={signup}>
                        <FieldGroup className="mt-10">
                            <Field data-invalid={!!state?.username}>
                                <input className="w-75 h-10 p-2 bg-white border placeholder:text-right" name="username" placeholder="username" autoComplete="off"></input>
                                <FieldError>{state?.username ? errorText(state?.username) : null}</FieldError>
                            </Field>
                        </FieldGroup>
                        <FieldGroup className="mt-10">
                            <Field data-invalid={!!state?.email}>
                                <input className="w-75 h-10 p-2 bg-white border placeholder:text-right" name="email" placeholder="email" autoComplete="off" type="email"></input>
                                <FieldError>{state?.email ? errorText(state?.email) : null}</FieldError>
                            </Field>
                        </FieldGroup>

                        <FieldGroup className="mt-10">
                            <Field data-invalid={!!state?.password}>
                                <input className="w-75 h-10 p-2 bg-white border placeholder:text-right" name="password" placeholder="password" type="password" autoComplete="off"></input>
                                <FieldError>{state?.password ? errorText(state?.password) : null}</FieldError>
                            </Field>
                        </FieldGroup>

                        <FieldGroup className="mt-10">
                            <Field data-invalid={!!state?.confirm}>
                                <input className="w-75 h-10 p-2 bg-white border placeholder:text-right" name="confirm" placeholder="confirm password" type="password" autoComplete="off"></input>
                                <FieldError>{state?.confirm ? errorText(state?.confirm) : null}</FieldError>
                            </Field>
                        </FieldGroup>

                        <Button className="h-10 px-4 mt-10" type="submit">
                            {isPending ? "登録中..." : "登録"}
                            {isPending && (<Spinner />)}
                            {!isPending && (<LogIn className="h-4 w-4" />)}
                        </Button>
                    </form>
                </div>
            </div>
        </>
    )
}