# TrackVolt Launch Readiness Audit
> Last updated: 2026-03-07

## Summary: NOT READY for App Store launch

### Web PWA Launch: READY
- Live at trackvolt.app
- All features functional
- Offline support working
- PWA install working

### iOS App Store Launch: BLOCKED

| Requirement | Status | Details |
|---|---|---|
| Capacitor installed | DONE | v8.1.0 |
| ios/ project exists | DONE | Bundle ID: app.trackvolt |
| App icons | DONE | Asset catalog exists |
| Launch screen | DONE | Storyboard exists |
| Privacy policy URL | MISSING | Need public URL |
| Support URL | MISSING | Need public URL |
| Info.plist permissions | MISSING | Camera, photo library strings needed |
| Xcode archive | NOT DONE | Need macOS |
| TestFlight build | NOT DONE | Need macOS + Apple Developer account |
| App Store screenshots | PARTIAL | Web screenshots exist, need native format |
| App Store metadata | NOT DONE | Description, keywords, category |

### Launch Sequence (When Ready)
1. Publish privacy policy + support URLs
2. Add Info.plist permission strings
3. Create App Store Connect listing
4. Archive in Xcode → upload to TestFlight
5. Internal testing → external testing → submit for review

### Estimated Effort
- Privacy/support URLs: 1-2 hours
- Info.plist + metadata: 1-2 hours
- Xcode build + TestFlight: 2-4 hours (requires macOS)
- Total: ~1 day of focused work (macOS required)
