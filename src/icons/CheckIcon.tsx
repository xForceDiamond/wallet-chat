import { SVGAttributes } from 'react'

export default function CheckIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            width="12"
            height="10"
            viewBox="0 0 12 10"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                d="M11.7762 0.501897C12.0514 0.746509 12.0762 1.16789 11.8316 1.44308L4.7205 9.44308C4.59399 9.5854 4.41265 9.66684 4.22223 9.66684C4.0318 9.66684 3.85047 9.5854 3.72396 9.44308L0.168401 5.44308C-0.0762111 5.16789 -0.051424 4.74651 0.223765 4.5019C0.498953 4.25728 0.920335 4.28207 1.16495 4.55726L4.22223 7.9967L10.8351 0.557261C11.0797 0.282072 11.5011 0.257285 11.7762 0.501897Z"
                fill="#4C9AFF"
            />
        </svg>
    )
}
