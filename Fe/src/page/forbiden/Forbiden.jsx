import { Link } from 'react-router-dom'

function Forbiden() {
  return (
    <div className="w-screen h-screen flex justify-center items-center flex-col gap-7">
      <div className="flex justify-center items-center gap-3 text-gray-400">
        <h1 className="font-extrabold text-9xl">403</h1>
        <p className="text-2xl">You are not allowed!</p>
      </div>
      <Link to={'/'} className="primary-btn">
        Go back to home page
      </Link>
    </div>
  )
}

export default Forbiden
