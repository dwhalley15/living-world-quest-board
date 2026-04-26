import { ArrowLeft } from "lucide-react"
import { Link } from "@tanstack/react-router"

export default function BackButton() {
    return(
        <Link to="/" className="inline-flex items-center gap-2 text-primary/80 hover:text-primary transition-colors mb-8 font-quest">
            <ArrowLeft className="w-4 h-4" />
            Return to the Quest Board
        </Link>
    )
}