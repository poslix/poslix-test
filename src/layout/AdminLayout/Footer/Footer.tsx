import { useContext } from "react"
import { darkModeContext } from "src/context/DarkModeContext"





export default function Footer() {
  const {darkMode} = useContext(darkModeContext)
  return (
    <footer className={`footer flex-column flex-md-row border-top d-flex align-items-center justify-content-between px-4 py-2 ${darkMode ? "dark-mode-body" : "light-mode-body"}`}>
      <div>
        <a className="text-decoration-none" href="https://poslix.com">Poslix App, </a>
        <a className="text-decoration-none" href="https://poslix.com">
          Make Your Business Online
        </a>
        {' '}
        © 2023
      </div>
    </footer>
  )
}
