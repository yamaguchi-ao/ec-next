"use client"

import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { formState, loginAction } from "../actions/login-action";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/toast";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { LogIn } from "lucide-react";
import logo from "@/public/ecsite-title.png";

export default function LoginForm({ adminFlg = false }: { adminFlg?: boolean }) {

    const searchParams = useSearchParams();

    const clickCount = useRef(0);
    const router = useRouter();

    useEffect(() => {
        const reason = searchParams.get("reason");
        if (reason === "session_expired") {
            toast.add({
                type: "error",
                description:
                    <span className="whitespace-pre-line">
                        {"セッションが切れました。\n再度ログインを行ってください。"}
                    </span>
            })
        }
    }, [searchParams]);

    const handleClick = () => {
        clickCount.current++;

        if (clickCount.current >= 5) {
            clickCount.current = 0;
            router.push("/login/admin");
        }
    };

    const [state, login, isPending] = useActionState(
        async (prevState: unknown, formData: FormData) => {
            const result = await loginAction(prevState as formState, formData, adminFlg);
            if (result?.fieldErrors) {
                return result?.fieldErrors;
            } else {
                toast.add({
                    type: result?.success ? "success" : "error",
                    description: result?.message,
                });

                if (result?.success) {
                    if (adminFlg) {
                        router.push("/dashboard");
                    } else {
                        router.push("/products/list");
                    }
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
        <div className="flex w-full h-screen">
            <div className="flex flex-1 bg-muted"></div>
            <div className="flex flex-col justify-center items-center">
                <Image src={logo} alt="Logo" className="h-15 w-auto" loading="eager" onClick={handleClick} />
                <h1 className="mt-7 font-extrabold text-4xl mr-3">{adminFlg ? "管理者" : ""}ログイン</h1>
                <div className="mx-14 mb-14 w-85">
                    <form className="flex flex-col justify-center items-center h-full" action={login} id="login">
                        <FieldGroup className="mt-15">
                            <Field data-invalid={!!state?.email}>
                                <input id="name" className={`h-10 p-2 border bg-white placeholder:text-right ${state?.email && "border-red-500"}`}
                                    name="email" placeholder="email" type="email" autoComplete="off" disabled={isPending} aria-invalid={!!state?.email}></input>
                                <FieldError>{state?.email && errorText(state?.email)}</FieldError>
                            </Field>
                        </FieldGroup>

                        <FieldGroup className="mt-12">
                            <Field data-invalid={!!state?.password}>
                                <input className={`h-10 p-2 border bg-white placeholder:text-right ${state?.password && "border-red-500"}`}
                                    name="password" placeholder="password" type="password" autoComplete="off" disabled={isPending} aria-invalid={!!state?.password}></input>
                                <FieldError>{state?.password ? errorText(state?.password) : ""}</FieldError>
                            </Field>
                        </FieldGroup>

                        <Button className="h-10 px-4 mt-15" type="submit" disabled={isPending} form="login">
                            {isPending ? "ログイン中..." : "ログイン"}
                            {isPending && (<Spinner />)}
                            {!isPending && <LogIn className="h-4 w-4" />}
                        </Button>
                    </form>
                </div>
                {adminFlg ? null : <p className="">新規登録は ⇒ <Link className="underline underline-offset-1 text-blue-500" href={"/signup"}>こちら</Link> ⇐ から</p>}
            </div>
        </div >
    )
}