import SwiftUI

enum Palette {
    static let ink = Color(red: 0.043, green: 0.051, blue: 0.071)
    static let mint = Color(red: 0.784, green: 1.0, blue: 0.239)
    static let paper = Color(red: 0.957, green: 0.945, blue: 0.910)
    static let muted = Color(red: 0.655, green: 0.667, blue: 0.643)
    static let line = Color(red: 0.204, green: 0.216, blue: 0.231)
    static let panel = Color(red: 0.078, green: 0.090, blue: 0.106)

    static let display = Font.custom("Barlow", size: 42).weight(.black)
    static let displayLarge = Font.custom("Barlow", size: 56).weight(.black)
    static let body = Font.custom("DM Sans", size: 14)
    static let micro = Font.custom("DM Mono", size: 10)
}

enum Links {
    static let eula = URL(string: "https://bright-sdk.com/eula")!
    static let sdkPrivacy = URL(string: "https://bright-sdk.com/privacy-policy")!
    static let learnMore = URL(string: "https://bright-sdk.com/users#learn-more-about-bright-sdk-web-indexing")!
    static let app = URL(string: "http://127.0.0.1:4173/app")!
}
