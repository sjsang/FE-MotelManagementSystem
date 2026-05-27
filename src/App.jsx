import { Rating } from '@mui/material'

function App() {
  return (
    <div className="pt-10 m-auto text-center">
      <p className="text-3xl font-bold">NHÀ NGHỈ 79</p>

      <Rating name="size-small" value={1} readOnly />

      <p className="text-gray-700">Ấp 7, xã Khánh An, huyện U Minh, Cà Mau.</p>
    </div>
  )
}

export default App
