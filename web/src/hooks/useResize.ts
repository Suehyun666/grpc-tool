export function useResize() {
    const startResize = (
        startWidth: number,
        setter: (w: number) => void,
        min: number,
        max: number
    ) => (e: React.MouseEvent) => {
        e.preventDefault()
        const sx = e.clientX
        const sw = startWidth

        const onMove = (ev: MouseEvent) => {
            const w = sw + (ev.clientX - sx)
            if (w > min && w < max) setter(w)
        }
        const onUp = () => {
            document.removeEventListener('mousemove', onMove)
            document.removeEventListener('mouseup', onUp)
        }
        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
    }

    return { startResize }
}
