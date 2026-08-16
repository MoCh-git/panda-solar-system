param([int]$Port = 8388)
$ErrorActionPreference = 'Continue'
$root = $PSScriptRoot
if (-not $root) { $root = Split-Path -Parent $MyInvocation.MyCommand.Path }

# List LAN IPv4 addresses (for phone access on same Wi-Fi)
$ips = @()
foreach ($nic in [System.Net.NetworkInformation.NetworkInterface]::GetAllNetworkInterfaces()) {
  if ($nic.OperationalStatus -ne 'Up') { continue }
  foreach ($ua in $nic.GetIPProperties().UnicastAddresses) {
    if ($ua.Address.AddressFamily -eq 'InterNetwork') {
      $ip = $ua.Address.IPAddressToString
      if ($ip -ne '127.0.0.1' -and $ip -notlike '169.254.*') { $ips += $ip }
    }
  }
}

$listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $Port)
try { $listener.Start() } catch {
  Write-Host "ERROR: cannot listen on port $Port. Is another copy already running?"
  exit 1
}

Write-Host "=================================================="
Write-Host "  Panda Solar System site server started"
Write-Host "  Folder: $root"
Write-Host ""
Write-Host "  This PC:   http://127.0.0.1:$Port/"
if ($ips.Count -gt 0) {
  Write-Host "  Phone (same Wi-Fi):"
  foreach ($ip in $ips) { Write-Host ("      http://{0}:{1}/" -f $ip, $Port) }
}
Write-Host ""
Write-Host "  Close this window to stop the server."
Write-Host "  (Star progress is saved in each browser.)"
Write-Host "=================================================="

while ($true) {
  $client = $listener.AcceptTcpClient()
  try {
    $stream = $client.GetStream()
    $stream.ReadTimeout = 5000
    $stream.WriteTimeout = 5000
    $reader = [System.IO.StreamReader]::new($stream)
    $requestLine = $reader.ReadLine()
    while ($true) { $l = $reader.ReadLine(); if ($l -eq '' -or $null -eq $l) { break } }
    $path = '/'
    if ($requestLine -match '^GET\s+(\S+)') { $path = ($Matches[1].Split('?'))[0] }
    if ($path -eq '/') { $path = '/index.html' }
    $file = Join-Path $root ($path.TrimStart('/') -replace '/', '\')
    if (($file -like "$root*") -and (Test-Path $file -PathType Leaf)) {
      $body = [System.IO.File]::ReadAllBytes($file)
      $ext = [System.IO.Path]::GetExtension($file).ToLower()
      $mime = 'text/html; charset=utf-8'
      if ($ext -eq '.css') { $mime = 'text/css; charset=utf-8' }
      elseif ($ext -eq '.js') { $mime = 'text/javascript; charset=utf-8' }
      elseif ($ext -eq '.png') { $mime = 'image/png' }
      elseif ($ext -eq '.jpg' -or $ext -eq '.jpeg') { $mime = 'image/jpeg' }
      elseif ($ext -eq '.svg') { $mime = 'image/svg+xml' }
      elseif ($ext -eq '.json') { $mime = 'application/json; charset=utf-8' }
      $header = "HTTP/1.1 200 OK`r`nContent-Type: $mime`r`nContent-Length: $($body.Length)`r`nConnection: close`r`n`r`n"
      $hb = [System.Text.Encoding]::ASCII.GetBytes($header)
      $stream.Write($hb, 0, $hb.Length)
      $stream.Write($body, 0, $body.Length)
    } else {
      $header = "HTTP/1.1 404 Not Found`r`nContent-Type: text/plain`r`nContent-Length: 0`r`nConnection: close`r`n`r`n"
      $hb = [System.Text.Encoding]::ASCII.GetBytes($header)
      $stream.Write($hb, 0, $hb.Length)
    }
    $stream.Flush()
    Start-Sleep -Milliseconds 30
  } catch { }
  finally { $client.Close() }
}
