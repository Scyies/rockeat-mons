import { Footer } from "../components/Footer";
import { Header } from "../components/Header";
import defaultProfile from '../assets/prof-icon.svg';
import { Input } from "../components/Inputs";
import { Button } from "../components/Button";
import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { convertBase64 } from "../utils/convertBase64";
import { useUserAuth } from "../firebase/UserAuthContext";
import { userProfileUpdate } from "../firebase/UserProfileUpdate";
import { ErrorMessage } from "../components/ErrorMessage";
import { getUserInfo } from "../firebase/GetUserInfo";
import { SuccessPopUp } from "../components/SuccessPopUp";
import { telMask } from "../utils/masks";

export function Profile() {
  const [values, setValues]: any = useState({
    name: '',
    telNumber: '',
    city: '',
    bioMessage: '',
    avatarURL: ''
  });

  const [error, setError] = useState('')

  const [isLoading, setIsLoading] = useState(false)

  const [popUp, setPopUp] = useState(false);
  
  const { user } = useUserAuth();  

  function popUpNavigate(): void {
    setPopUp(false);
  }
  
  async function imgInpuChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files![0];

      const base64 = await convertBase64(file);
      setValues({
        ...values,
        avatarURL: base64
      })
  };
  
  async function handleSave(e: FormEvent) {
    setIsLoading(true);
    e.preventDefault();
    
    if(values.name === undefined || !values.name) {
      return setError('Por favor informe seu nome'), setIsLoading(false)
    }
    if(values.telNumber === undefined || !values.telNumber) {
      return setError('Por favor informe seu telefone'), setIsLoading(false)
    }
    if(values.city === undefined || !values.city) {
      return setError('Por favor informe sua cidade'), setIsLoading(false)
    }
    if(values.bioMessage === undefined || !values.bioMessage) {
      return setError('Por favor preencha o campo "Sobre"'), setIsLoading(false)
    }

    try {
      await userProfileUpdate(
        values.name,
        values.telNumber,
        values.city,
        user.email,
        values.bioMessage,
        values.avatarURL
      );
      setPopUp(true);
      setIsLoading(false);
    } catch (error: any) {
      setError(error.message);
      console.log(error.code);
      setIsLoading(false);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    if(user){getUserInfo(user, setValues)}
  },[]);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      { popUp && <SuccessPopUp loadingBar={false} onClick={popUpNavigate} message="Seus dados foram salvos com sucesso!" />}

      <main className="md:bg-right-img md:bg-right md:bg-contain bg-no-repeat flex flex-col flex-grow">
          <h2 className="text-blue-500 px-16 pt-14 pb-6 text-center">
          Esse é o perfil que aparece para responsáveis ou ONGs que recebem sua mensagem.
        </h2>
        <form onSubmit={handleSave} className="bg-gray-300 flex flex-col flex-grow mx-6 mb-4 rounded-md px-4 py-8 place-items-center w-[95%] md:w-[80%] max-w-[312px] md:max-w-[550px] self-center">
          <h2 className="text-gray-900 font-semibold text-center mb-4">
            Perfil
          </h2>

          <div className="flex flex-col pb-1 w-full">
            <label
              className="text-blue-500 pb-1 font-semibold"
            >
              Foto
            </label>
            <div className="flex flex-col place-items-center relative">
              { values.avatarURL ? <img src={values.avatarURL} alt=""
                className="w-20 h-20 mb-1 rounded-full object-cover max-h-[80px] max-w-[80px]"
              /> : 
                <img src={defaultProfile} alt=""
                className="w-20 mb-1 rounded-full object-cover max-h-[80px] max-w-[80px]"
              />}
              <input type="file" accept="img/*" 
                onChange={imgInpuChange}
                className="opacity-0 absolute h-[80px] w-[80px]"
              />
              
              <span className="text-red-500 text-xs pb-6 hover:underline">
                Clique na foto para editar
              </span>
            </div>
          </div>

          <div className="flex flex-col pb-4 w-full">
            <label
              className="text-blue-500 pb-1 font-semibold"
            >
              Nome
            </label>
            <Input name="Nome" type="text"
            value={values.name}
            id='name-input'
            holder="Seu nome completo"
            change={(e: ChangeEvent<HTMLInputElement>) => setValues({ 
              ...values,
              name: e.target.value
            })} 
            />
          </div>

          <div className="flex flex-col pb-4 w-full">
            <label
              className="text-blue-500 pb-1 font-semibold"
            >
              Telefone
            </label>
            <Input name="tel" type="tel" 
            value={values.telNumber} 
            holder="Seu telefone para contato"
            mask={true}
            change={(e: ChangeEvent<HTMLInputElement>) => setValues({ 
              ...values,
              telNumber: e.target.value
            })} />
          </div>

          <div className="flex flex-col pb-4 w-full">
            <label
              className="text-blue-500 pb-1 font-semibold"
            >
              Cidade
            </label>
            <Input name="cidade" type="text" 
            value={values.city} 
            holder="A cidade em que você mora"
            change={(e: ChangeEvent<HTMLInputElement>) => setValues({ 
              ...values,
              city: e.target.value
            })} />
          </div>

          <div className="flex flex-col w-full">
            <label
              className="text-blue-500 pb-4 font-semibold"
            >
              Sobre
            </label>
            <textarea name="message" id="message" 
              cols={15} rows={5} 
              placeholder="Nos conte um pouco sobre você"
              className="rounded-md mb-8 pl-4 pt-4 shadow-md min-w-[240px] max-w-[336px] md:max-w-[492px] self-center w-full"
              defaultValue={values.bioMessage}
              onChange={(e: ChangeEvent<HTMLTextAreaElement>) => setValues({ 
                ...values,
                bioMessage: e.target.value
              })}
            >
            </textarea>
          </div>

          { error && <ErrorMessage error={error} /> }

          <Button name="Salvar" click={handleSave} loading={isLoading} />
        </form>
      </main>
      <Footer />
    </div>
  )
}