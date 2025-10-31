import { Button } from '@/components/ui/button'


export default function Pagamento () {
    return (

            <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-xl sm:text-5xl md:text-5xl font-bold mb-6 text-center py-15">
        Selecione o método de pagamento que deseja:
      </h1>

    <Button className="text-base sm:text-lg md:text-xl font-bold w-full sm:w-auto px-6 py-3 mb-8 sm:m-6 md:m-12 rounded-2xl shadow-md transition-all">
     Pix
      </Button>

      <Button className=" text-base sm:text-lg md:text-xl font-bold w-full sm:w-auto px-6 py-3 mb-8 sm:m-6 md:m-12 rounded-2xl shadow-md transition-all">
     Cartão de débito
      </Button>

      <Button className=" text-base sm:text-lg md:text-xl font-bold w-full sm:w-auto px-6 py-3 mb-8 sm:m-6 md:m-12 rounded-2xl shadow-md transition-all">
     Cartão de crédito 
      </Button>

       <Button className=" text-base sm:text-lg md:text-xl font-bold w-full sm:w-auto px-6 py-3 mb-8 sm:m-6 md:m-12 rounded-2xl shadow-md transition-all">
     Boleto 
      </Button>
      </div>



    )
}