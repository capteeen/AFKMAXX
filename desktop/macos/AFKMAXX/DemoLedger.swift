import Combine
import Foundation

struct DemoReceipt: Identifiable, Codable {
    var id: String
    var at: Date
    var label: String
    var bytes: Int
    var ms: Int
    var points: Int

    var afk: Double { Double(points) / 100 }
}

@MainActor
final class DemoLedger: ObservableObject {
    @Published private(set) var receipts: [DemoReceipt] = []

    private let key = "afkmaxx.demo.receipts.v1"
    private let labels = [
        "Idle index · public HTML",
        "Idle index · asset ping",
        "Idle index · robots.txt",
        "Idle index · favicon"
    ]

    var usedBytes: Int { receipts.reduce(0) { $0 + $1.bytes } }
    var points: Int { receipts.reduce(0) { $0 + $1.points } }
    var potentialAfk: Double { Double(points) / 100 }
    var capBytes: Int { 100 * 1024 * 1024 }
    var capProgress: Double { min(1, Double(usedBytes) / Double(capBytes)) }
    var atCap: Bool { usedBytes >= capBytes }

    func load() {
        guard let data = UserDefaults.standard.data(forKey: key),
              let rows = try? JSONDecoder().decode([DemoReceipt].self, from: data) else {
            receipts = []
            return
        }
        receipts = rows.sorted { $0.at > $1.at }
    }

    func tick() {
        if atCap { return }
        let bytes = Int.random(in: 12_000...90_000)
        let ms = Int.random(in: 80...420)
        let mbPoints = Int((Double(bytes) / (1024 * 1024) * 5).rounded())
        let row = DemoReceipt(
            id: UUID().uuidString,
            at: Date(),
            label: labels.randomElement()!,
            bytes: bytes,
            ms: ms,
            points: 25 + mbPoints
        )
        receipts.insert(row, at: 0)
        receipts = Array(receipts.prefix(80))
        persist()
    }

    func persist() {
        if let data = try? JSONEncoder().encode(receipts) {
            UserDefaults.standard.set(data, forKey: key)
        }
    }
}
