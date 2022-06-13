import {
    ButtonHTMLAttributes,
    HTMLAttributes,
    AnchorHTMLAttributes,
    ReactNode,
    useEffect,
    useRef,
    useState,
} from 'react'
import { createPortal } from 'react-dom'
import tw, { css } from 'twin.macro'
import Text from './Text'

type Props = HTMLAttributes<HTMLDivElement> & {
    anchorEl?: HTMLButtonElement | null
    onMouseDownOutside?: () => void
}

function getRect(element: HTMLElement | null | undefined) {
    return element ? element.getBoundingClientRect() : undefined
}

export default function Menu({ anchorEl, onMouseDownOutside, ...props }: Props) {
    const [rect, setRect] = useState(getRect(anchorEl))

    const portalRootRef = useRef<HTMLDivElement>(document.createElement('div'))

    useEffect(() => {
        document.body.appendChild(portalRootRef.current)

        return () => {
            document.body.removeChild(portalRootRef.current)
        }
    }, [])

    const rootRef = useRef<HTMLDivElement>(null)

    const anchorElRef = useRef(anchorEl)

    useEffect(() => {
        anchorElRef.current = anchorEl
    }, [anchorEl])

    const onMouseDownOutsideRef = useRef(onMouseDownOutside)

    useEffect(() => {
        onMouseDownOutsideRef.current = onMouseDownOutside
    }, [onMouseDownOutside])

    useEffect(() => {
        function onResize() {
            setRect(getRect(anchorElRef.current))
        }

        window.addEventListener('resize', onResize)

        return () => {
            window.removeEventListener('resize', onResize)
        }
    }, [])

    useEffect(() => {
        function handleClickOutside(e: any) {
            const { current: root } = rootRef

            const { current: anchor } = anchorElRef

            if (!root || root.contains(e.target)) {
                return
            }

            if (!anchor || anchor.contains(e.target)) {
                return
            }

            if (typeof onMouseDownOutsideRef.current === 'function') {
                onMouseDownOutsideRef.current()
            }
        }

        document.addEventListener('mousedown', handleClickOutside)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
        }
    }, [])

    return createPortal(
        <div
            {...props}
            ref={rootRef}
            css={[
                rect &&
                    css`
                        transform: translateX(${rect.x}px) translateX(${rect.width}px)
                            translateX(-100%) translateY(${rect.y}px) translateY(${rect.height}px);
                    `,
                tw`
                    bg-white
                    absolute
                    rounded-[10px]
                    shadow-[0px 0px 10px rgba(0, 0, 0, 0.1)]
                    w-[250px]
                    min-h-[1rem]
                    py-1
                    text-[0.875rem]
                    mt-2
                    top-0
                    left-0
                    overflow-hidden
                `,
            ]}
        />,
        portalRootRef.current
    )
}

type ClickableHTMLElementProps =
    | AnchorHTMLAttributes<HTMLAnchorElement>
    | ButtonHTMLAttributes<HTMLButtonElement>

type MenuItemProps<T = ClickableHTMLElementProps> = T & {
    tag?: 'a' | 'button'
    icon?: ReactNode
}

function MenuItem({ tag: Tag = 'button', icon, children, ...propsProp }: MenuItemProps) {
    let props: unknown

    if (Tag === 'button') {
        props = propsProp as ButtonHTMLAttributes<HTMLButtonElement>
    }

    if (Tag === 'a') {
        props = propsProp as AnchorHTMLAttributes<HTMLAnchorElement>
    }

    return (
        <Tag
            {...props}
            css={[
                tw`
                    bg-white
                    w-full
                    text-left
                    flex
                    items-center
                    h-9
                    !text-[#59799C]
                    hover:bg-[#EFF4F9]
                `,
            ]}
        >
            <div
                css={[
                    tw`
                        w-10
                        flex-shrink-0
                        flex
                        justify-center
                        [svg]:block
                    `,
                ]}
            >
                {icon}
            </div>
            <div>
                <Text>{children}</Text>
            </div>
        </Tag>
    )
}

export function MenuLinkItem(props: MenuItemProps<AnchorHTMLAttributes<HTMLAnchorElement>>) {
    return <MenuItem {...props} tag="a" />
}

export function MenuSeparatorItem(props: HTMLAttributes<HTMLHRElement>) {
    return (
        <hr
            {...props}
            css={[
                tw`
                    border-0
                    h-[1px]
                    bg-[#DEE6EE]
                    my-1
                `,
            ]}
        />
    )
}

export function MenuButtonItem({
    type = 'button',
    ...props
}: MenuItemProps<ButtonHTMLAttributes<HTMLButtonElement>>) {
    return <MenuItem {...props} tag="button" type={type} />
}
