interface Navigator {
    scheduling:
        | {
              isInputPending: (() => boolean) | undefined
          }
        | undefined
}
