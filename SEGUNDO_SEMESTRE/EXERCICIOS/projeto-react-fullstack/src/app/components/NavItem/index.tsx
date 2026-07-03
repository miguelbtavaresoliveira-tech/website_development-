import Link from "next/link";


  export interface NavItemInterface {
        url: string,
        label: string,
    }


export default function NavItem(props: NavItemInterface) {

    return (

        <li className="nav-item">
            <Link href={props.url} className="nav-link">
                {props.label}</Link>
        </li>
    )
}