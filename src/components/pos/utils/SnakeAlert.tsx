import Snackbar from '@mui/material/Snackbar';
import { useState, useContext, useEffect } from 'react'

export default function SnakeAlert({ title, show, fun }: any) {
    const [openSnakeBar, setOpenSnakeBar] = useState(true);
    const handleClose = () => {
    };
    useEffect(() => {
        setOpenSnakeBar(show)
        setTimeout(() => {
            setOpenSnakeBar(false)
            fun(false)
        }, 2000)
    }, [show])
    return (
        <>
            <Snackbar
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
                open={openSnakeBar}
                onClose={handleClose}
                onClick={() => { setOpenSnakeBar(false) }}
                message={title}
            />
        </>
    )
}