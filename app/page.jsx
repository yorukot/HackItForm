"use client";

import { useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { z } from "zod"; // 引入 zod
import { zodResolver } from "@hookform/resolvers/zod"; // 用來解決 zod 與 react-hook-form 之間的整合
import { Button } from "@/components/ui/button";
import WelcomePage from "@/components/form/page1";
import TeamSizePage from "@/components/form/page2";
import TeamMembersPage from "@/components/form/page3";
import AccompanyingPersonsPage from "@/components/form/page4";
import ExhibitorsPage from "@/components/form/page5";
import { API_END_POINT } from "@/lib/variable";
import { ClipLoader } from "react-spinners";

const emergencyContactSchema = z.object({
  name: z.string().min(1, "緊急聯絡人姓名必填"),
  relationship: z.string().min(1, "關係必填"),
  phone: z
    .string()
    .length(10, "電話號碼必須為 10 碼")
    .refine((val) => val.startsWith("09"), "電話號碼必須以 09 開頭"),
});

const accompanyingPersonSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "姓名必填"),
  email: z.string().email("Email 格式不正確"),
  phone: z
    .string()
    .length(10, "電話號碼必須為 10 碼")
    .refine((val) => val.startsWith("09"), "電話號碼必須以 09 開頭"),
});

const teamMemberSchema = z.object({
  name: z.string().min(1, "姓名必填"),
  gender: z.enum(["男", "女", "其他"]),
  school: z.string().min(1, "學校必填"),
  grade: z.enum(["一", "二", "三"]),
  identityNumber: z.string().length(10, "身份字號必須為 10 碼"),
  birthday: z.string().min(1, "生日必填"),
  email: z.string().email("Email 格式不正確"),
  phone: z
    .string()
    .length(10, "手機號碼必須為 10 碼")
    .refine((val) => val.startsWith("09"), "手機號碼必須以 09 開頭"),
  emergencyContacts: z
    .array(emergencyContactSchema)
    .min(1, "至少需要一位緊急聯絡人"),
  allergies: z.string().optional(),
  specialDiseases: z.string().optional(),
  remarks: z.string().optional(),
  tShirtSize: z.enum(["S", "M", "L", "XL", "2L", "3L", "4L"]),
});

const exhibitorSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "姓名必填"),
  email: z.string().min(1, "Email 必填").email("Email 格式不正確"), // 確保 email 格式正確
});

const formSchema = z.object({
  teamName: z
    .string()
    .min(2, "團隊名稱至少 2 個字")
    .max(30, "團隊名稱最多 30 個字"),
  teamSize: z.string().min(1, "請選擇參賽團隊人數"),
  teamMembers: z.array(teamMemberSchema).min(1, "至少需要一位團隊成員"),
  accompanyingPersons: z
    .array(accompanyingPersonSchema)
    .max(2, "最多 2 位陪伴人"),
  exhibitors: z
    .array(exhibitorSchema) // 使用 exhibitorSchema 限制參展人的結構
    .max(50, "最多 50 位參展人"),
});

// 使用 zod 的驗證類型
const StepForm = () => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const methods = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      teamName: "",
      teamMembers: [],
      accompanyingPersons: [],
      exhibitors: [],
    },
  });

  const nextStep = () => setStep((prevStep) => prevStep + 1);
  const prevStep = () => setStep((prevStep) => prevStep - 1);

  const onSubmit = async (data) => {
    setLoading(true);
    setSubmitSuccess(false);
    setSubmitError(false);

    try {
      const response = await fetch(API_END_POINT + "users/team/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json();
      console.log("成功提交數據:", responseData);
      setSubmitSuccess(true);
    } catch (error) {
      console.error("提交失敗:", error);
      setSubmitError(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <ClipLoader color="#4A90E2" loading={loading} size={50} />
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className="min-h-screen flex flex-col justify-center items-center bg-gray-100 p-4"
      >
        <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-2xl">
          {step === 1 && <WelcomePage onNext={nextStep} />}
          {step === 2 && <TeamSizePage onNext={nextStep} onPrev={prevStep} />}
          {step === 3 && <TeamMembersPage onNext={nextStep} onPrev={prevStep} />}
          {step === 4 && <AccompanyingPersonsPage onNext={nextStep} onPrev={prevStep} />}
          {step === 5 && <ExhibitorsPage onNext={nextStep} onPrev={prevStep} />}
          {step === 6 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">恭喜你完成表單的填寫，請點選下面的按鈕進行發送</h2>
              {/* 僅在提交成功或錯誤時隱藏按鈕 */}
              {!submitSuccess && !submitError && (
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <ClipLoader size={20} color="#fff" /> : "提交表單"}
                </Button>
              )}
              <button
                type="button"
                onClick={prevStep}
                className="mt-4 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded"
              >
                上一頁
              </button>
              {submitSuccess && (
                <p className="text-green-500 mt-4">報名成功! 請查收電子郵件信箱進行驗證(每位成員)</p>
              )}
              {submitError && (
                <p className="text-red-500 mt-4">出現未知的錯誤，請稍後再試一次</p>
              )}
            </div>
          )}
        </div>
      </form>
    </FormProvider>
  );
};

export default StepForm;