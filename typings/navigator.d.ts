interface Navigator {
    scheduling:
        | {
              isFramePending: (() => boolean) | undefined
              isInputPending: (() => boolean) | undefined
          }
        | undefined
}
